import 'package:chongyai_mobile/widgets/auth_shell.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('AuthPageShell places header and card content', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: AuthPageShell(
          header: Text('Header'),
          child: Text('Body'),
        ),
      ),
    );

    expect(find.text('Header'), findsOneWidget);
    expect(find.text('Body'), findsOneWidget);
  });

  testWidgets('AuthBrandHeader renders branding and texts', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: AuthBrandHeader(
            title: 'Welcome back',
            subtitle: 'Sign in to continue',
          ),
        ),
      ),
    );

    expect(find.text('Chongyai'), findsOneWidget);
    expect(find.text('Welcome back'), findsOneWidget);
    expect(find.text('Sign in to continue'), findsOneWidget);
    expect(find.byIcon(Icons.work_outline_rounded), findsOneWidget);
  });

  testWidgets('AuthCard renders top bar and children', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: AuthCard(
            children: [
              Text('Field A'),
              SizedBox(height: 8),
              Text('Field B'),
            ],
          ),
        ),
      ),
    );

    expect(find.text('Field A'), findsOneWidget);
    expect(find.text('Field B'), findsOneWidget);
    expect(find.byType(Material), findsWidgets);
  });
}
