using POS.Main.Business.Table.Models.Reservation;
using POS.Main.Core.Models;

namespace POS.Main.Business.Table.Interfaces;

public interface IReservationService
{
    Task<PaginationResult<ReservationResponseModel>> GetReservationsAsync(
        DateOnly? dateFrom, DateOnly? dateTo, string? status, PaginationModel param, CancellationToken ct = default);

    Task<List<ReservationResponseModel>> GetTodayReservationsAsync(CancellationToken ct = default);

    Task<ReservationResponseModel> GetReservationByIdAsync(int reservationId, CancellationToken ct = default);

    Task<ReservationResponseModel> CreateReservationAsync(
        CreateReservationRequestModel request, CancellationToken ct = default);

    Task<ReservationResponseModel> UpdateReservationAsync(
        int reservationId, UpdateReservationRequestModel request, CancellationToken ct = default);

    Task<ReservationResponseModel> ConfirmReservationAsync(
        int reservationId, ConfirmReservationRequestModel request, CancellationToken ct = default);

    Task<ReservationResponseModel> CheckInReservationAsync(int reservationId, CancellationToken ct = default);

    Task<ReservationResponseModel> CancelReservationAsync(int reservationId, CancellationToken ct = default);

    Task<ReservationResponseModel> NoShowReservationAsync(int reservationId, CancellationToken ct = default);
}
