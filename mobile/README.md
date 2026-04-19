# Chongyai Job Center Management System - Mobile

Mobile application for Chongyai Job Center Management System, developed with Flutter.

This mobile app supports major user roles in the system (admin, recruiter, and applicant), including authentication, job posting/searching, application tracking, invitations, interview-related workflows, and profile management.

## Credits

This mobile module is crafted by **Group Jiancha** for the **Chongyai Job Center Management System** project.

## Tech Stack

- Flutter (Dart)
- Provider (state management)
- Go Router (routing/navigation)
- HTTP (API communication)
- Shared Preferences and Flutter Secure Storage (local/token storage)

## Prerequisites

Before running the project, make sure you have:

- Flutter SDK installed (stable channel recommended)
- Dart SDK (included with Flutter)
- Android Studio/Xcode or a connected device/emulator
- Git

Useful checks:

```bash
flutter --version
flutter doctor
```

## Environment Setup

1. Go to the `mobile` directory.
2. Create a `.env` file by copying from `.env.example`.
3. Set the backend API endpoint.

Example:

```env
API_BASE_URL="https://two025-itcs383-chongyai.onrender.com/api"
```

## Project Setup (First Time)

From the project root:

```bash
cd mobile
flutter pub get
```

## Run the App

### Recommended (easiest and best for development)

For this project, the simplest and most stable way to run and test UI quickly is:

```bash
flutter run -d chrome
```

Why this is recommended:

- Fast startup and hot reload for day-to-day development
- No need to boot Android emulator for basic feature testing
- Easy to reproduce and demo in class/team environments

### Other run options

From the `mobile` directory:

```bash
flutter run
```

If you have multiple devices:

```bash
flutter devices
flutter run -d <device_id>
```

## Build for Release

### Android APK

```bash
flutter build apk --release
```

### Android App Bundle (Play Store)

```bash
flutter build appbundle --release
```

### iOS (on macOS only)

```bash
flutter build ios --release
```

## Testing and Quality Checks

Run static analysis:

```bash
flutter analyze
```

Run tests:

```bash
flutter test
```

Run both in sequence:

```bash
flutter analyze && flutter test
```

## CI/CD (GitHub Actions)

The repository CI workflow now includes a dedicated **mobile job** in `.github/workflows/ci.yml` that:

1. Sets up Flutter on Ubuntu runner
2. Installs dependencies with `flutter pub get`
3. Runs `flutter analyze`
4. Runs `flutter test`

This ensures every push and pull request to `master` verifies mobile code quality and tests automatically.

## Useful Troubleshooting

- If dependencies fail, run `flutter pub get` again.
- If build cache causes issues, try:

```bash
flutter clean
flutter pub get
```

- If emulator/device is not detected, check:

```bash
flutter doctor
flutter devices
```

## Folder Notes

- `lib/` main app source code (screens, providers, services, models, widgets)
- `test/` automated tests
- `android/`, `ios/`, `web/`, etc. platform-specific files

## Reference

- [Flutter Documentation](https://docs.flutter.dev/)
- [Flutter Testing](https://docs.flutter.dev/testing)
