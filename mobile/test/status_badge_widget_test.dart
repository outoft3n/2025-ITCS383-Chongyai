import 'package:chongyai_mobile/widgets/status_badge.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

Widget _wrap(Widget child) => MaterialApp(home: Scaffold(body: child));

void main() {
  testWidgets('StatusBadge renders transformed status text', (tester) async {
    await tester.pumpWidget(_wrap(const StatusBadge(status: 'INTERVIEWING')));
    expect(find.text('INTERVIEWING'), findsOneWidget);
  });

  testWidgets('StatusBadge supports unknown status with default color path', (
    tester,
  ) async {
    await tester.pumpWidget(_wrap(const StatusBadge(status: 'UNKNOWN_STATE')));
    expect(find.text('UNKNOWN STATE'), findsOneWidget);
    expect(find.byType(Container), findsWidgets);
  });
}
