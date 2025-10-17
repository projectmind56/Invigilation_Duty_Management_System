using backend.DTOs;
using backend.Interfaces;
using backend.Models;
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

        [HttpPost("addExamTimeTable")]
        public async Task<IActionResult> Add([FromBody] ExamTimeTableDto dto)
        {
            try
            {
                var result = await _adminInterface.AddExamTimeTableAsync(dto);
                if (result)
                    return Ok(new { message = "Exam timetable added successfully." });

                return BadRequest(new { message = "Failed to add timetable." });
            }
            catch (InvalidOperationException ex)
            {
                // Custom error for duplicate subject code
                return Conflict(new { message = ex.Message }); // 409 Conflict
            }
            catch (Exception ex)
            {
                // General server error
                return StatusCode(500, new { message = "An unexpected error occurred.", details = ex.Message });
            }
        }


        [HttpGet("allExamTimeTables")]
        public async Task<IActionResult> GetAllExamTimeTables()
        {
            var list = await _adminInterface.GetAllExamTimeTablesAsync();
            return Ok(list);
        }

        [HttpDelete("deleteTimeTable/{id}")]
        public async Task<IActionResult> DeleteExamTimeTable(int id)
        {
            var success = await _adminInterface.DeleteExamTimeTableAsync(id);
            if (!success) return NotFound("Timetable entry not found.");
            return Ok(new { message = "Deleted successfully." });
        }
        [HttpPut("updateExamTimeTable/{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] ExamTimeTableModel model)
        {
            await _adminInterface.UpdateExamTimeTableAsync(id, model);
            return Ok();
        }

    }
}
