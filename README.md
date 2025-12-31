# iDotMatrix Home Assistant Integration

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/integration)
[![GitHub release (latest by date)](https://img.shields.io/github/v/release/adriantukendorf/iDotMatrix-HomeAssistant)](https://github.com/adriantukendorf/iDotMatrix-HomeAssistant/releases)

A fully featured, modern Home Assistant integration for **iDotMatrix** pixel art displays. 

Connects directly to your device via Bluetooth (native or proxy) without any cloud dependencies. Unlock the full potential of your display with advanced animations, typography controls, and "Party Mode" features.

---

## ✨ Features

- **🚀 Instant Bluetooth Connectivity**: Supports native adapters and ESPHome Bluetooth Proxies for rock-solid connections.
- **📝 Advanced Text Engine**: 
    - Full control over Font, Color, Speed, and Animation Mode.
    - **Pixel Perfect Fonts**: Comes with built-in bitmap fonts (e.g., VT323, Press Start 2P) for crisp rendering.
    - **Typography Controls**: Adjust Letter Spacing (horizontal/vertical), Blur/Sharpness, and Font Size.
- **🎉 Fun Text (Party Mode)**: 
    - Animates messages word-by-word with random bright colors.
    - Adjustable delay for perfect timing.
- **📏 Autosize Perfect Fit**: 
    - Automatically scales text to perfectly fit the screen bounds, centering it for a pro look.
- **🕰️ Clock Control**: 
    - Syncs time automatically.
    - Customizable 12h/24h formats, date display, and colors.
- **🎨 Drawing & Images**:
    - Upload images or text-as-images (Multiline support).
    - Control panel brightness and screen dimensions (16x16 / 32x32).
- **🔋 Device Control**:
    - Turn On/Off, set Brightness.

---

## 🛠️ Installation

### Option 1: HACS (Recommended)
1. Open HACS in Home Assistant.
2. Go to **Integrations** > **Triple Dots** > **Custom Repositories**.
3. Add `https://github.com/adriantukendorf/iDotMatrix-HomeAssistant` as an **Integration**.
4. Click **Download**.
5. Restart Home Assistant.

### Option 2: Manual
1. Download the `custom_components/idotmatrix` folder from this repository.
2. Copy it to your Home Assistant `config/custom_components/` directory.
3. Restart Home Assistant.

---

## ⚙️ Configuration

1. Go to **Settings** > **Devices & Services**.
2. Click **Add Integration** and search for **iDotMatrix**.
3. The integration will automatically discover nearby devices. Select your device.
    - *Note: Ensure your device is powered on and not connected to the phone app.*

---

## 📖 Usage Guide

### 📝 Text Control
Control the scrolling text on your device using the `Display Text` entity.
- **Entity**: `text.idotmatrix_display_text`
- **Actions**: Type any text to update the display immediately.
- **Settings**: Use the configuration entities (sliders/selects) to adjust:
    - **Font**: Choose from installed pixel-perfect fonts.
    - **Speed**: Scroll speed (1-100).
    - **Color**: Full RGB control via `light.idotmatrix_panel_colour`.
    - **Spacing**: Tweak kerning with "Text Spacing".

### 🎉 Fun Text (Party Mode)
Want to spice things up? Use the Fun Text entity!
- **Entity**: `text.idotmatrix_fun_text`
- **How it works**:
    1. Enter a phrase like "HAPPY NEW YEAR".
    2. The display will show one word at a time.
    3. Each word gets a **random bright color** from a curated palette.
- **Control**: Adjust the speed of the animation with the **Fun Text Delay** slider (`number.idotmatrix_fun_text_delay`).

### 📏 Autosize (Perfect Fit)
Stop guessing font sizes. Let the integration do the math.
- **Entity**: `switch.idotmatrix_text_perfect_fit_autosize`
- **How it works**:
    - **ON**: The integration iteratively resizes your text (shrinking from max size) until it fits perfectly within the screen capabilities 
    - **OFF**: Standard scrolling or manual font size.

### 🕰️ Clock & Time
- **Sync Time**: Press `button.idotmatrix_sync_time` to instantly sync the device clock to Home Assistant's time.
- **Formats**: Toggle `select.idotmatrix_clock_format` (12h/24h) and `switch.idotmatrix_clock_show_date`.

### 📶 Bluetooth Proxy
This integration fully supports **ESPHome Bluetooth Proxies**.
- If your Home Assistant server is far from the device, use a cheap ESP32 with ESPHome to extend range.
- The integration will automatically find and use the proxy with the best signal.

---

## 🔧 Troubleshooting

**"Device unavailable" / "No backend found"**
- Ensure the device is **disconnected** from the mobile app. It can only talk to one controller at a time.
- If using a local adapter on macOS/Linux, ensure BlueZ is up to date.
- Restart the iDotMatrix device (unplug/replug).

**Blocking Calls / Slow Startup**
- This integration uses non-blocking async calls for all operations to ensure your Home Assistant remains snappy.

---

<p align="center">
  Built with ❤️ by Adrian Tukendorf
</p>
