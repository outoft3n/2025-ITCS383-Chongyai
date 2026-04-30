import 'package:chongyai_mobile/widgets/loading_overlay.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

Widget _wrap(Widget child) => MaterialApp(home: Scaffold(body: child));

void main() {
  testWidgets('LoadingOverlay hides progress when not loading', (tester) async {
    await tester.pumpWidget(
      _wrap(
        const LoadingOverlay(
          isLoading: false,
          child: Text('content'),
        ),
      ),
    );

    expect(find.text('content'), findsOneWidget);
    expect(find.byType(CircularProgressIndicator), findsNothing);
  });

  testWidgets('LoadingOverlay shows progress when loading', (tester) async {
    await tester.pumpWidget(
      _wrap(
        const LoadingOverlay(
          isLoading: true,
          child: Text('content'),
        ),
      ),
    );

    expect(find.text('content'), findsOneWidget);
    expect(find.byType(CircularProgressIndicator), findsOneWidget);
  });
}
