namespace TaskManager.API.DTOs;

public class PauseRequestDto
{
    public int TaskId { get; set; }
    public string? Reason { get; set; }
}
