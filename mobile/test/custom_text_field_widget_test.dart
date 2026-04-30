import 'package:chongyai_mobile/widgets/custom_text_field.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

Widget _wrap(Widget child) => MaterialApp(home: Scaffold(body: Form(child: child)));

void main() {
  testWidgets('CustomTextField uses default required validation', (tester) async {
    final controller = TextEditingController();
    final formKey = GlobalKey<FormState>();

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: Form(
            key: formKey,
            child: CustomTextField(label: 'Email', controller: controller),
          ),
        ),
      ),
    );

    final valid = formKey.currentState!.validate();
    await tester.pump();

    expect(valid, isFalse);
    expect(find.text('Email is required'), findsOneWidget);
  });

  testWidgets('CustomTextField uses custom validator callback', (tester) async {
    final controller = TextEditingController(text: 'abc');
    final formKey = GlobalKey<FormState>();

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: Form(
            key: formKey,
            child: CustomTextField(
              label: 'Password',
              controller: controller,
              obscureText: true,
              validator: (value) => value == 'ok' ? null : 'invalid',
            ),
          ),
        ),
      ),
    );

    final valid = formKey.currentState!.validate();
    await tester.pump();

    expect(valid, isFalse);
    expect(find.text('invalid'), findsOneWidget);
  });
}
