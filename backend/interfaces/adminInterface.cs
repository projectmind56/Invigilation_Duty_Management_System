using backend.DTOs;
using backend.Models;

namespace backend.Interfaces
{
    public interface IAdminInterface
    {
        Task<List<StaffModel>> GetAllStaffAsync();
        Task<bool> ApproveOrRejectStaffAsync(StaffApprovalDto dto);
    }
}
