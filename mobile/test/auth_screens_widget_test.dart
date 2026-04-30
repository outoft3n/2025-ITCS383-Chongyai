import 'package:chongyai_mobile/providers/auth_provider.dart';
import 'package:chongyai_mobile/screens/auth/login_screen.dart';
import 'package:chongyai_mobile/screens/auth/register_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';

class _FakeAuthProvider extends AuthProvider {
  int loginCalls = 0;
  int registerCalls = 0;

  @override
  Future<void> login({required String email, required String password}) async {
    loginCalls++;
  }

  @override
  Future<void> register({
    required String email,
    required String password,
    required String role,
    required String firstName,
    required String lastName,
    String? companyName,
  }) async {
    registerCalls++;
  }
}

Widget _app(Widget child, _FakeAuthProvider auth) {
  return ChangeNotifierProvider<AuthProvider>.value(
    value: auth,
    child: MaterialApp(home: child),
  );
}

void main() {
  testWidgets('LoginScreen validates fields and quick fill role buttons', (tester) async {
    final auth = _FakeAuthProvider();
    await tester.pumpWidget(_app(const LoginScreen(), auth));

    await tester.tap(find.text('Sign In'));
    await tester.pump();
    expect(find.text('Email is required'), findsOneWidget);
    expect(find.text('Password is required'), findsOneWidget);

    await tester.enterText(find.widgetWithText(TextFormField, 'Email'), 'bad-email');
    await tester.tap(find.text('Sign In'));
    await tester.pump();
    expect(find.text('Invalid email address'), findsOneWidget);

    await tester.tap(find.widgetWithText(OutlinedButton, 'Admin'));
    await tester.pump();
    expect(find.widgetWithText(TextFormField, 'Email'), findsOneWidget);
    expect(auth.loginCalls, 0);
  });

  testWidgets('LoginScreen shows error and loading state from provider', (tester) async {
    final auth = _FakeAuthProvider()
      ..error = 'Invalid credentials'
      ..isLoading = true;

    await tester.pumpWidget(_app(const LoginScreen(), auth));

    expect(find.text('Invalid credentials'), findsOneWidget);
    expect(find.byType(CircularProgressIndicator), findsOneWidget);
    expect(find.text('Sign In'), findsNothing);
  });

  testWidgets('RegisterScreen validates required fields and role toggle', (tester) async {
    final auth = _FakeAuthProvider();
    await tester.pumpWidget(_app(const RegisterScreen(), auth));

    await tester.ensureVisible(find.text('Create Account'));
    await tester.tap(find.text('Create Account'));
    await tester.pump();
    expect(find.text('First name is required'), findsOneWidget);
    expect(find.text('Last name is required'), findsOneWidget);
    expect(find.text('Email is required'), findsOneWidget);
    expect(find.text('Password is required'), findsOneWidget);

    await tester.enterText(find.widgetWithText(TextFormField, 'Password'), '12345678');
    await tester.enterText(find.widgetWithText(TextFormField, 'Confirm Password'), 'different');
    await tester.ensureVisible(find.text('Create Account'));
    await tester.tap(find.text('Create Account'));
    await tester.pump();
    expect(find.text("Passwords don't match"), findsOneWidget);

    expect(find.widgetWithText(TextFormField, 'Company Name'), findsNothing);
    await tester.scrollUntilVisible(find.text('Employer'), 200, scrollable: find.byType(Scrollable).first);
    await tester.tap(find.text('Employer'));
    await tester.pumpAndSettle();
    expect(find.widgetWithText(TextFormField, 'Company Name'), findsOneWidget);
    expect(auth.registerCalls, 0);
  });
}
