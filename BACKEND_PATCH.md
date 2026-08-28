# Backend patch required for the merged itrola Ride (rider + driver) app

Two small changes needed in your FastAPI backend.

---

## 1. Return `user_id` from `/auth/verify-otp`

Right now `TokenResponse` only carries `access_token`. The app needs the
rider's or driver's own id to call `/drivers/{driver_id}/location` etc.

**In `app/schemas/schemas.py`**, find `class TokenResponse` and add a field:

```python
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str          # <-- add this line
```

**In `app/routers/auth.py`**, update both branches of `verify_otp` to pass
`user_id` back:

```python
if payload.role == "rider":
    user = db.query(User).filter(User.phone == payload.phone).first()
    if not user:
        user = User(phone=payload.phone)
        db.add(user)
        db.commit()
        db.refresh(user)
    token = create_access_token(subject=user.id, role="rider")
    return TokenResponse(access_token=token, user_id=user.id)   # <-- changed

elif payload.role == "driver":
    driver = db.query(Driver).filter(Driver.phone == payload.phone).first()
    if not driver:
        raise HTTPException(
            status_code=404,
            detail="No driver account found. Complete onboarding first."
        )
    token = create_access_token(subject=driver.id, role="driver")
    return TokenResponse(access_token=token, user_id=driver.id)  # <-- changed
```

(Remove the old single `return TokenResponse(access_token=token)` line at
the bottom of the function — it's now returned inside each branch instead.)

---

## 2. Add `/trips/mine/current` so a driver can find their assigned trip

**In `app/routers/trips.py`**, add this new route directly above the
existing `@router.get("/{trip_id}")` route (must be registered before it,
since `/mine/current` would otherwise be swallowed by the `{trip_id}`
pattern):

```python
@router.get("/mine/current", response_model=TripOut)
def get_current_trip_for_driver(
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(require_driver),
):
    """Returns the driver's active trip (matched/in_progress), or 404."""
    trip = (
        db.query(Trip)
        .filter(Trip.driver_id == current_user.id)
        .filter(Trip.status.in_([TripStatus.matched, TripStatus.en_route, TripStatus.in_progress]))
        .order_by(Trip.requested_at.desc())
        .first()
    )
    if not trip:
        raise HTTPException(status_code=404, detail="No active trip")
    return trip
```

No new imports needed — everything used here (`Trip`, `TripStatus`,
`require_driver`, `TripOut`, `HTTPException`) is already imported at the
top of `trips.py`.

---

## Verify both patches

Restart uvicorn (or let `--reload` catch it), then run:

```powershell
python -c "from app.main import app; [print(r.path, r.methods) for r in app.routes]"
```

You should see `/trips/mine/current {'GET'}` in the list.

Then test the OTP flow via Swagger UI (`/docs`) — call `/auth/verify-otp`
and confirm the JSON response now includes `user_id`.
