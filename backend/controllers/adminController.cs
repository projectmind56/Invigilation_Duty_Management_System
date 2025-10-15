using backend.DTOs;
using backend.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminInterface _adminInterface;

        public AdminController(IAdminInterface adminInterface)
        {
            _adminInterface = adminInterface;
        }

        [HttpGet("staff")]
        public async Task<IActionResult> GetAllStaffAsync()
        {
            var staffList = await _adminInterface.GetAllStaffAsync();
            return Ok(staffList);
        }

        [HttpPost("approve")]
        public async Task<IActionResult> ApproveOrRejectStaff([FromBody] StaffApprovalDto dto)
        {
            var result = await _adminInterface.ApproveOrRejectStaffAsync(dto);
            if (!result) return NotFound("Staff not found");

            return Ok(new { message = $"Staff has been {dto.Status.ToLower()}ed." });
        }
    }
}
