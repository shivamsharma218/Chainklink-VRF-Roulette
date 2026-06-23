// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

contract Roulette is VRFConsumerBaseV2Plus, ReentrancyGuard {
    enum Color {
        Red,
        Black,
        Green
    }

    enum RoundPhase {
        Idle, 
        Open,
        AwaitingRandomness,
        ReadyToSettle 
    }

    struct Bet {
        address player;
        uint256 amount;
        Color color;
    }

   
    uint256 public subscriptionId;
    bytes32 public keyHash;
    uint32 public callbackGasLimit = 200_000;
    uint16 public requestConfirmations = 3;
    uint32 public constant NUM_WORDS = 1;

    uint256 public currentRequestId;

  
    RoundPhase public phase;
    uint256 public roundId;
    uint256 public winningNumber;

    uint256 public houseEdgeBps = 250; // 2.5%
    address public houseWallet;
    uint256 public houseProfit;

    Bet[] public bets;
    mapping(address => uint256) public winnings;
    mapping(Color => uint256) public multiplier;

    event RoundStarted(uint256 indexed roundId);
    event BetPlaced(uint256 indexed roundId, address indexed player, uint256 netAmount, Color color);
    
    event BettingClosed(uint256 indexed roundId, uint256 indexed requestId);
    event RoundEnded(uint256 indexed roundId, uint256 winningNumber);


    event RoundSettled(uint256 indexed roundId, uint256 totalPaidOut);
    event RewardClaimed(address indexed player, uint256 amount);
    event HouseWalletUpdated(address indexed newWallet);

    constructor(
        address vrfCoordinator,
        uint256 _subscriptionId,
        bytes32 _keyHash
    ) VRFConsumerBaseV2Plus(vrfCoordinator) {
        houseWallet = msg.sender;
        subscriptionId = _subscriptionId;
        keyHash = _keyHash;

        multiplier[Color.Red] = 2;
        multiplier[Color.Black] = 2;
        multiplier[Color.Green] = 35;
    }


    function startRound() external onlyOwner {
        require(phase == RoundPhase.Idle, "Previous round not finished");

        delete bets;
        winningNumber = 0;
        roundId++;
        phase = RoundPhase.Open;

        emit RoundStarted(roundId);
    }

    function placeBet(Color _color) external payable {
        require(phase == RoundPhase.Open, "Betting closed");
        require(msg.value > 0, "Zero bet");

        uint256 edge = (msg.value * houseEdgeBps) / 10000;
        uint256 netAmount = msg.value - edge;
        houseProfit += edge;

       
        bets.push(Bet(msg.sender, netAmount, _color));

        emit BetPlaced(roundId, msg.sender, netAmount, _color);
    }

   
    function closeBettingAndRequestRandomness() external onlyOwner {
        require(phase == RoundPhase.Open, "Round not open");
        require(bets.length > 0, "No bets placed");

        phase = RoundPhase.AwaitingRandomness;

        uint256 requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: keyHash,
                subId: subscriptionId,
                requestConfirmations: requestConfirmations,
                callbackGasLimit: callbackGasLimit,
                numWords: NUM_WORDS,
                extraArgs: VRFV2PlusClient._argsToBytes(
                    VRFV2PlusClient.ExtraArgsV1({nativePayment: false})
                )
            })
        );

        currentRequestId = requestId;

        emit BettingClosed(roundId, requestId);
    }

    function fulfillRandomWords(uint256 requestId, uint256[] calldata randomWords) internal override {
        require(phase == RoundPhase.AwaitingRandomness, "Not awaiting randomness");
        require(requestId == currentRequestId, "Unknown request id");

        winningNumber = randomWords[0] % 37;
        phase = RoundPhase.ReadyToSettle;

        emit RoundEnded(roundId, winningNumber);
    }

    function settleRound() external {
        require(phase == RoundPhase.ReadyToSettle, "Not ready to settle");

        uint256 totalPaidOut = _payoutWinners();

        phase = RoundPhase.Idle;

        emit RoundSettled(roundId, totalPaidOut);
    }

    function _payoutWinners() internal returns (uint256 totalPayout) {
        Color winningColor = getWinningColor(winningNumber);
        uint256 len = bets.length;

        for (uint256 i = 0; i < len; i++) {
            Bet memory bet = bets[i];
            if (_isWinningBet(bet.color, winningColor)) {
                totalPayout += bet.amount * multiplier[bet.color];
            }
        }

        require(address(this).balance >= totalPayout, "Insufficient liquidity");

   
        for (uint256 i = 0; i < len; i++) {
            Bet memory bet = bets[i];
            if (_isWinningBet(bet.color, winningColor)) {
                winnings[bet.player] += bet.amount * multiplier[bet.color];
            }
        }
    }

    function _isWinningBet(Color betColor, Color winningColor) internal pure returns (bool) {
        if (winningColor == Color.Green) {
            return betColor == Color.Green;
        }
        return betColor == winningColor;
    }

    function getWinningColor(uint256 number) public pure returns (Color) {
        if (number == 0) {
            return Color.Green; // house number
        }
        if (number % 2 == 0) {
            return Color.Black;
        }
        return Color.Red;
    }

      function claimReward() external nonReentrant {
        uint256 amount = winnings[msg.sender];
        require(amount > 0, "Nothing to claim");

        winnings[msg.sender] = 0; // effects before interaction

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");

        emit RewardClaimed(msg.sender, amount);
    }

    function withdrawHouseProfit() external onlyOwner nonReentrant {
        require(houseProfit > 0, "No profit");

        uint256 amount = houseProfit;
        houseProfit = 0;

        (bool success, ) = payable(houseWallet).call{value: amount}("");
        require(success, "Transfer failed");
    }

    function setHouseWallet(address newWallet) external onlyOwner {
        require(newWallet != address(0), "Zero address");
        houseWallet = newWallet;
        emit HouseWalletUpdated(newWallet);
    }

    function setHouseEdgeBps(uint256 newEdgeBps) external onlyOwner {
        require(newEdgeBps <= 1000, "Edge too high"); // hard cap at 10%
        houseEdgeBps = newEdgeBps;
    }



    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function totalBets() external view returns (uint256) {
        return bets.length;
    }

    receive() external payable {}
}