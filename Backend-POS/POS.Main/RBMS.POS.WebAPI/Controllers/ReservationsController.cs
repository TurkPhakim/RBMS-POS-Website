using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using POS.Main.Business.Table.Interfaces;
using POS.Main.Business.Table.Models.Reservation;
using POS.Main.Core.Constants;
using POS.Main.Core.Models;
using RBMS.POS.WebAPI.Filters;

namespace RBMS.POS.WebAPI.Controllers;

[Authorize]
[Route("api/table/reservations")]
public class ReservationsController : BaseController
{
    private readonly IReservationService _reservationService;

    public ReservationsController(IReservationService reservationService)
    {
        _reservationService = reservationService;
    }

    [HttpGet]
    [PermissionAuthorize(Permissions.Reservation.Read)]
    [ProducesResponseType(typeof(PaginationResult<ReservationResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetReservations(
        [FromQuery] DateOnly? dateFrom, [FromQuery] DateOnly? dateTo,
        [FromQuery] string? status, [FromQuery] PaginationModel param,
        CancellationToken ct = default)
        => PagedSuccess(await _reservationService.GetReservationsAsync(dateFrom, dateTo, status, param, ct));

    [HttpGet("today")]
    [PermissionAuthorize(Permissions.Reservation.Read)]
    [ProducesResponseType(typeof(ListResponseModel<ReservationResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTodayReservations(CancellationToken ct = default)
        => ListSuccess(await _reservationService.GetTodayReservationsAsync(ct));

    [HttpGet("{reservationId}")]
    [PermissionAuthorize(Permissions.Reservation.Read)]
    [ProducesResponseType(typeof(BaseResponseModel<ReservationResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetReservation(int reservationId, CancellationToken ct = default)
        => Success(await _reservationService.GetReservationByIdAsync(reservationId, ct));

    [HttpPost]
    [PermissionAuthorize(Permissions.Reservation.Create)]
    [ProducesResponseType(typeof(BaseResponseModel<ReservationResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> CreateReservation(
        [FromBody] CreateReservationRequestModel request, CancellationToken ct = default)
        => Success(await _reservationService.CreateReservationAsync(request, ct));

    [HttpPut("{reservationId}")]
    [PermissionAuthorize(Permissions.Reservation.Update)]
    [ProducesResponseType(typeof(BaseResponseModel<ReservationResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateReservation(
        int reservationId, [FromBody] UpdateReservationRequestModel request, CancellationToken ct = default)
        => Success(await _reservationService.UpdateReservationAsync(reservationId, request, ct));

    [HttpPost("{reservationId}/confirm")]
    [PermissionAuthorize(Permissions.Reservation.Update)]
    [ProducesResponseType(typeof(BaseResponseModel<ReservationResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ConfirmReservation(
        int reservationId, [FromBody] ConfirmReservationRequestModel request, CancellationToken ct = default)
        => Success(await _reservationService.ConfirmReservationAsync(reservationId, request, ct));

    [HttpPost("{reservationId}/check-in")]
    [PermissionAuthorize(Permissions.Reservation.Update)]
    [ProducesResponseType(typeof(BaseResponseModel<ReservationResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> CheckInReservation(int reservationId, CancellationToken ct = default)
        => Success(await _reservationService.CheckInReservationAsync(reservationId, ct));

    [HttpPost("{reservationId}/cancel")]
    [PermissionAuthorize(Permissions.Reservation.Update)]
    [ProducesResponseType(typeof(BaseResponseModel<ReservationResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> CancelReservation(int reservationId, CancellationToken ct = default)
        => Success(await _reservationService.CancelReservationAsync(reservationId, ct));

    [HttpPost("{reservationId}/no-show")]
    [PermissionAuthorize(Permissions.Reservation.Update)]
    [ProducesResponseType(typeof(BaseResponseModel<ReservationResponseModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> NoShowReservation(int reservationId, CancellationToken ct = default)
        => Success(await _reservationService.NoShowReservationAsync(reservationId, ct));
}
