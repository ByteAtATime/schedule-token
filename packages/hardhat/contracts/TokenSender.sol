// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";

contract TokenSender is Ownable {
    // should be kept in sync with `SendStatusStatus` enum in lib/runes/sends.svelte.ts
    enum Status { Scheduled, Completed, NotEnoughAllowance, NotEnoughBalance, OtherFail }

    struct ScheduledSend {
        uint256 id;
        address sender;
        address receiver;
        address token;
        uint256 amount;
        uint256 releaseTime;
        Status status;
    }

    uint256[] public scheduledSends;
    ScheduledSend[] public allSends;
    mapping(address => uint256[]) public sendsByAddress;
    uint256 public nextScheduledSendId;
    uint256 public executionInterval = 15 minutes; // Default execution interval

    event Scheduled(uint256 indexed id, address indexed sender, address indexed receiver, address token, uint256 amount, uint256 releaseTime);
    event Sent(uint256 indexed id, address indexed sender, address indexed receiver, address token, uint256 amount, Status status);
    event ExecutionIntervalChanged(uint256 newInterval);

    function scheduleSend(address _receiver, address _token, uint256 _amount, uint256 _releaseTime) external {
        require(_releaseTime > block.timestamp, "Release time must be in the future");
        require(_amount > 0, "Amount must be greater than zero");

        IERC20 token = IERC20(_token);
        require(token.allowance(msg.sender, address(this)) >= _amount, "Contract not allowed to transfer token");

        uint256 id = nextScheduledSendId++;
        ScheduledSend memory newSend = ScheduledSend({
            id: id,
            sender: msg.sender,
            receiver: _receiver,
            token: _token,
            amount: _amount,
            releaseTime: _releaseTime,
            status: Status.Scheduled
        });

        assert(id == allSends.length);

        allSends.push(newSend);
        scheduledSends.push(id);

        sendsByAddress[msg.sender].push(id);

        emit Scheduled(id, msg.sender, _receiver, _token, _amount, _releaseTime);
    }

    function executeScheduledSends() external onlyOwner {
        uint256 latestTime = block.timestamp + executionInterval;

        for (uint256 i = scheduledSends.length; i > 0; i--) {
            ScheduledSend storage scheduledSend = allSends[scheduledSends[i - 1]];
            if (scheduledSend.status == Status.Scheduled && scheduledSend.releaseTime <= latestTime) {
                scheduledSend.status = executeTransfer(scheduledSend);
                scheduledSend.releaseTime = block.timestamp;
                emit Sent(scheduledSend.id, scheduledSend.sender, scheduledSend.receiver, scheduledSend.token, scheduledSend.amount, scheduledSend.status);
                
                removeSend(i-1);
            }
        }
    }

    function executeTransfer(ScheduledSend storage _scheduledSend) internal returns (Status) {
        IERC20 token = IERC20(_scheduledSend.token);
        if (token.allowance(_scheduledSend.sender, address(this)) < _scheduledSend.amount) {
            return Status.NotEnoughAllowance;
        }
        if (token.balanceOf(_scheduledSend.sender) < _scheduledSend.amount) {
            return Status.NotEnoughBalance;
        }
        try token.transferFrom(_scheduledSend.sender, _scheduledSend.receiver, _scheduledSend.amount) {
            return Status.Completed;
        } catch (bytes memory) {
            return Status.OtherFail;
        }
    }

    function removeSend(uint256 index) internal {
      uint256 lastIndex = scheduledSends.length - 1;
      scheduledSends[index] = scheduledSends[lastIndex];
      scheduledSends.pop();
    }

    function setExecutionInterval(uint256 _interval) external onlyOwner {
        executionInterval = _interval;
        emit ExecutionIntervalChanged(_interval);
    }

    function addressSendLength(address _address) external view returns (uint256) {
      return sendsByAddress[_address].length;
    }
}
