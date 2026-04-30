import 'package:chongyai_mobile/providers/auth_provider.dart';
import 'package:chongyai_mobile/widgets/account_profile_view.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';

class _FakeAuthProvider extends AuthProvider {
  int logoutCalls = 0;

  @override
  Future<void> logout() async {
    logoutCalls++;
  }
}

void main() {
  testWidgets('AccountProfileView renders without crashing during load cycle', (tester) async {
    final auth = _FakeAuthProvider();
    await tester.pumpWidget(
      ChangeNotifierProvider<AuthProvider>.value(
        value: auth,
        child: const MaterialApp(
          home: Scaffold(body: AccountProfileView()),
        ),
      ),
    );

    await tester.pump(const Duration(milliseconds: 800));
    expect(find.byType(AccountProfileView), findsOneWidget);
    expect(find.byType(CircularProgressIndicator), findsWidgets);
    expect(auth.logoutCalls, 0);
  });
}
