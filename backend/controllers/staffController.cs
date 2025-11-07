using backend.Interfaces;
using backend.Dto;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using backend.Dtos;
using backend.DTOs;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StaffController : ControllerBase
    {
        private readonly IStaffInterface _staffInterfaces;

        public StaffController(IStaffInterface staffInterfaces)
        {
            _staffInterfaces = staffInterfaces;
        }

        [HttpPost("register")]
        public async Task<IActionResult> RegisterAsync(RegisterDto registerDto)
        {
            var result = await _staffInterfaces.RegisterAsync(registerDto);
            if (!result)
                return BadRequest(new { message = "Staff with this email already exists." });

            return Ok(new { message = "Registration request submitted successfully." });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto loginDto)
        {
            var token = await _staffInterfaces.LoginAsync(loginDto);
            if (token == null)
                return Unauthorized(new { message = "Invalid email or password." });

            return Ok(new { token }); // or use "message" if you want to customize it
        }
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var list = await _staffInterfaces.GetAllAsync();
            return Ok(list);
        }

        [HttpGet("get-staff-time-table/{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var item = await _staffInterfaces.GetByStaffIdAsync(id);
            if (item == null) return NotFound(new { message = "Timetable not found." });
            return Ok(item);
        }

        [HttpPost("create-staff-time-table")]
        public async Task<IActionResult> Create([FromBody] StaffTimeTableDto dto)
        {
            var newItem = await _staffInterfaces.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = newItem.Id }, newItem);
        }

        [HttpPut("update-staff-time-table/{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] StaffTimeTableDto dto)
        {
            var updated = await _staffInterfaces.UpdateAsync(id, dto);
            if (updated == null) return NotFound(new { message = "Timetable not found." });
            return Ok(updated);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _staffInterfaces.DeleteAsync(id);
            if (!deleted) return NotFound(new { message = "Timetable not found." });
            return Ok(new { message = "Deleted successfully." });
        }

        [HttpGet("allExamTimeTableAllocationsByStaffId/{id}")]
        public async Task<IActionResult> GetAllExamTimeTableAllocationsByStaffId(int id)
        {
            var list = await _staffInterfaces.GetAllExamTimeTableAllocationsByStaffId(id);
            return Ok(list);
        }

        [HttpPut("acceptExamTimeTableAllocation/{id}")]
        public async Task<IActionResult> AcceptExamTimeTableAllocation(int id)
        {
            var result = await _staffInterfaces.AcceptExamTimeTableAllocationAsync(id);
            if (!result) return NotFound(new { message = "Allocation not found" });
            return Ok(new { message = "Allocation accepted successfully" });
        }

        [HttpGet("availableStaff")]
        public async Task<IActionResult> GetAvailableStaff([FromQuery] string session, [FromQuery] DateTime examDate, [FromQuery] int allocationId)
        {
            var result = await _staffInterfaces.GetAvailableStaffAsync(session, examDate, allocationId);
            return Ok(result);
        }

        [HttpPut("reallocateExamTimeTableAllocation/{allocationId}/{newStaffId}")]
        public async Task<IActionResult> ReallocateExamTimeTableAllocation(int allocationId, int newStaffId)
        {
            var result = await _staffInterfaces.ReallocateExamTimeTableAllocationAsync(allocationId, newStaffId);
            if (!result) return NotFound(new { message = "Allocation not found" });
            return Ok(new { message = "Reallocation successful" });
        }

        [HttpPost("requestReallocation")]
        public async Task<IActionResult> RequestReallocation([FromBody] ReallocationRequestDto dto)
        {
            var (success, message) = await _staffInterfaces.CreateReallocationRequestAsync(
                dto.AllocationId, dto.FromStaffId, dto.ToStaffIds, dto.ExamId
            );

            if (success)
                return Ok(new { success = true, message });
            else
                return BadRequest(new { success = false, message });
        }

[HttpGet("reallocationRequests/{toStaffId}")]
        public async Task<IActionResult> GetReallocationRequests(int toStaffId)
        {
            var requests = await _staffInterfaces.GetReallocationRequestsForStaffAsync(toStaffId);
            return Ok(requests);
        }

[HttpPut("reallocationRequests/accept")]
public async Task<IActionResult> AcceptReallocation([FromBody] ReallocationActionDto dto)
{
    var result = await _staffInterfaces.AcceptReallocationRequestAsync(dto.RequestId);
    if (!result) return NotFound(new { message = "Request or allocation not found." });
    return Ok(new { message = "Reallocation request accepted." });
}

[HttpPut("reallocationRequests/reject")]
public async Task<IActionResult> RejectReallocation([FromBody] ReallocationActionDto dto)
{
    var result = await _staffInterfaces.RejectReallocationRequestAsync(dto.RequestId);
    if (!result) return NotFound(new { message = "Request not found." });
    return Ok(new { message = "Reallocation request rejected." });
}



    }
}