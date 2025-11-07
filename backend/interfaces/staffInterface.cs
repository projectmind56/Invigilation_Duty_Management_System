using backend.Dto;
using backend.Dtos;
using backend.DTOs;
using backend.Models;
using System.Threading.Tasks;
using YourNamespace.Models;

namespace backend.Interfaces
{
    public interface IStaffInterface
    {
        Task<bool> RegisterAsync(RegisterDto registerDto);
        Task<string?> LoginAsync(LoginDto loginDto);
        Task<IEnumerable<StaffTimeTableModel>> GetAllAsync();
        Task<IEnumerable<StaffTimeTableModel>> GetByStaffIdAsync(int staffId);
        Task<StaffTimeTableModel> CreateAsync(StaffTimeTableDto dto);
        Task<StaffTimeTableModel?> UpdateAsync(int id, StaffTimeTableDto dto);
        Task<bool> DeleteAsync(int id);

        Task<List<ExamTimeTableModel>> GetAllExamTimeTableAllocationsByStaffId(int id);

        Task<bool> AcceptExamTimeTableAllocationAsync(int allocationId);
        Task<List<StaffInfoDto>> GetAvailableStaffAsync(string session, DateTime examDate, int allocationId);
        Task<bool> ReallocateExamTimeTableAllocationAsync(int allocationId, int newStaffId);

        Task<(bool Success, string Message)> CreateReallocationRequestAsync(
                int allocationId,
                int fromStaffId,
                List<int> toStaffIds,
                int examId
            );
        Task<List<ReallocationRequest>> GetAllRequestsAsync();
        Task<List<ReallocationRequest>> GetRequestsByStaffIdAsync(int staffId);

        Task<List<ReallocationRequestResponseDto>> GetReallocationRequestsForStaffAsync(int toStaffId);
    Task<bool> AcceptReallocationRequestAsync(int requestId);
    Task<bool> RejectReallocationRequestAsync(int requestId);
    }
}
