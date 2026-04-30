import 'package:flutter_test/flutter_test.dart';
import 'package:chongyai_mobile/services/math_service.dart';

void main() {
  final service = MathService();

  test('add works correctly', () {
    expect(service.add(2, 3), 5);
  });

  test('multiply works correctly', () {
    expect(service.multiply(2, 3), 6);
  });
}