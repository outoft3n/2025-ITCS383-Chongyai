import 'package:chongyai_mobile/core/theme/app_theme.dart';
import 'package:chongyai_mobile/screens/admin/admin_home_screen.dart';
import 'package:chongyai_mobile/screens/chat/chat_screen.dart';
import 'package:chongyai_mobile/screens/conference/conference_screen.dart';
import 'package:chongyai_mobile/screens/recruiter/recruiter_home_screen.dart';
import 'package:chongyai_mobile/screens/splash_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('SplashScreen shows logo icon and progress indicator', (tester) async {
    await tester.pumpWidget(const MaterialApp(home: SplashScreen()));
    expect(find.byIcon(Icons.work_outline_rounded), findsOneWidget);
    expect(find.byType(CircularProgressIndicator), findsOneWidget);
  });

  testWidgets('ChatScreen and ConferenceScreen render static content', (tester) async {
    await tester.pumpWidget(const MaterialApp(home: ChatScreen()));
    expect(find.text('Chat Support'), findsOneWidget);
    expect(find.textContaining('Bot chat interface'), findsOneWidget);

    await tester.pumpWidget(const MaterialApp(home: ConferenceScreen()));
    expect(find.text('Conference'), findsOneWidget);
    expect(find.textContaining('Conference room code'), findsOneWidget);
  });

  testWidgets('AdminHomeScreen renders app bar and tab labels', (tester) async {
    await tester.pumpWidget(MaterialApp(theme: AppTheme.theme, home: const AdminHomeScreen()));
    await tester.pump();

    expect(find.text('Admin Dashboard'), findsOneWidget);
    expect(find.text('Overview'), findsOneWidget);
    expect(find.text('Jobs'), findsOneWidget);
    expect(find.text('Payments'), findsOneWidget);
  });

  testWidgets('RecruiterHomeScreen renders app bar and tab labels', (tester) async {
    await tester.pumpWidget(MaterialApp(theme: AppTheme.theme, home: const RecruiterHomeScreen()));
    await tester.pump();

    expect(find.text('Recruiter Dashboard'), findsOneWidget);
    expect(find.text('Applicants'), findsOneWidget);
    expect(find.text('Interviews'), findsOneWidget);
    expect(find.text('Search'), findsOneWidget);
  });

  test('AppTheme exposes expected color scheme values', () {
    expect(AppTheme.primary, const Color(0xFFF97316));
    expect(AppTheme.accent, const Color(0xFFEAB308));
    expect(AppTheme.theme.useMaterial3, isTrue);
    expect(AppTheme.theme.colorScheme.primary, AppTheme.primary);
  });
}
