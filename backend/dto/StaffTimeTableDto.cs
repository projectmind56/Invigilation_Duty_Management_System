namespace backend.Dtos
{
    public class StaffTimeTableDto
    {
        public int Id { get; set; }
        public int StaffId { get; set; }
        public string SubjectName { get; set; }
        public string Day { get; set; }
        public int Period { get; set; }
    }
}
