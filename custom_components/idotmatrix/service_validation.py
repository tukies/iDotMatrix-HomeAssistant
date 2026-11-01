"""Validate display inputs before changing the active mode."""
import math

import voluptuous as vol
from homeassistant.helpers import config_validation as cv


def finite_number(value):
    """Reject NaN and infinity as well as non-numeric input."""
    value = vol.Coerce(float)(value)
    if not math.isfinite(value):
        raise vol.Invalid("Expected a finite number")
    return value


def service_schema(name):
    """Build the schema shared by the animated display services."""
    fields = {
        vol.Optional("pixel_size"): vol.All(vol.Coerce(int), vol.In((32, 64))),
        vol.Optional("follow"): cv.boolean,
        vol.Optional("hour24"): cv.boolean,
        vol.Optional("show_date"): cv.boolean,
        vol.Optional("rainbow"): cv.boolean,
        vol.Optional("color"): vol.All(
            list, vol.Length(min=3, max=3), [vol.All(vol.Coerce(int), vol.Range(min=0, max=255))]
        ),
        vol.Optional("mac_address"): str
    }
    for key in ("weather", "condition", "temperature", "humidity", "wind", "high", "low", "price", "change", "co2", "power", "heat", "cool"):
        fields[vol.Optional(f"{key}_entity")] = cv.entity_id
    if name == "show_color":
        return vol.Schema({
            vol.Required("color"): fields[vol.Optional("color")],
            vol.Optional("mac_address"): str
        })
    if name == "display_gif":
        return vol.Schema({
            vol.Required("path"): vol.All(cv.string, vol.Length(min=1)),
            vol.Optional("rotation_interval", default=5): vol.All(vol.Coerce(int), vol.Range(min=1, max=255)),
            vol.Optional("mac_address"): str
        })
    if name in ("show_co2", "show_power"):
        key = "co2_entity" if name == "show_co2" else "power_entity"
        del fields[vol.Optional(key)]
        fields[vol.Required(key)] = cv.entity_id
    if name == "show_message":
        fields.update({
            vol.Required("message"): vol.All(cv.string, vol.Length(min=1)),
            vol.Optional("style"): vol.In(("card", "marquee", "typewriter", "alert", "party")),
            vol.Optional("icon"): cv.string,
            vol.Optional("font"): cv.string,
            vol.Optional("duration"): vol.All(finite_number, vol.Range(min=0)),
        })
    if name == "show_clock":
        fields[vol.Optional("face")] = vol.Any("pixel", "analog", vol.All(vol.Coerce(int), vol.Range(min=0, max=7)))
    if name == "show_bitcoin":
        fields[vol.Optional("logo")] = vol.All(cv.string, vol.Length(min=0, max=128))
    schema = vol.Schema(fields)
    if name == "show_thermostat":
        return vol.All(schema, cv.has_at_least_one_key("heat_entity", "cool_entity"))
    return schema
