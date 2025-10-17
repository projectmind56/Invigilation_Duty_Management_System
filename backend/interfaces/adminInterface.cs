using backend.DTOs;
using backend.Models;

namespace backend.Interfaces
{
    public interface IAdminInterface
    {
        Task<List<StaffModel>> GetAllStaffAsync();
        Task<bool> ApproveOrRejectStaffAsync(StaffApprovalDto dto);
        Task<bool> AddExamTimeTableAsync(ExamTimeTableDto dto);
        Task<List<ExamTimeTableModel>> GetAllExamTimeTablesAsync();
        Task<bool> DeleteExamTimeTableAsync(int id);
        Task UpdateExamTimeTableAsync(int id, ExamTimeTableModel model);


    }
}
