import 'package:chongyai_mobile/models/payment.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('Payment.fromJson parses optional fields and toJson returns same shape', () {
    final json = <String, dynamic>{
      'id': 'pay-1',
      'userId': 'user-1',
      'amount': 999,
      'status': 'PAID',
      'transactionRef': 'TX-001',
      'paymentMethod': 'CARD',
      'paidAt': '2026-04-30T11:00:00.000Z',
      'createdAt': '2026-04-30T10:00:00.000Z',
      'user': {'email': 'user@email.com'},
    };

    final payment = Payment.fromJson(json);
    final serialized = payment.toJson();

    expect(payment.id, 'pay-1');
    expect(payment.amount, 999);
    expect(payment.paymentMethod, 'CARD');
    expect(payment.user?['email'], 'user@email.com');
    expect(serialized, json);
  });

  test('Payment.fromJson accepts null optional fields', () {
    final json = <String, dynamic>{
      'id': 'pay-2',
      'userId': 'user-2',
      'amount': 1200,
      'status': 'PENDING',
      'createdAt': '2026-04-30T10:00:00.000Z',
      'transactionRef': null,
      'paymentMethod': null,
      'paidAt': null,
      'user': null,
    };

    final payment = Payment.fromJson(json);

    expect(payment.transactionRef, isNull);
    expect(payment.paymentMethod, isNull);
    expect(payment.paidAt, isNull);
    expect(payment.user, isNull);
  });
}
