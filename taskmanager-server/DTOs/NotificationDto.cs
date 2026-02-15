namespace TaskManager.API.DTOs;

public class NotificationDto
{
    public int Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime CreatedDate { get; set; }
}

public class UnreadCountDto
{
    public int Count { get; set; }
}
