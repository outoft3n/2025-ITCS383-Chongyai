import 'package:chongyai_mobile/core/json_converters.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('readInt', () {
    test('handles int, double, string and invalid values', () {
      expect(readInt(5), 5);
      expect(readInt(5.6), 6);
      expect(readInt('42'), 42);
      expect(readInt('x'), isNull);
      expect(readInt(null), isNull);
    });
  });

  group('readBool', () {
    test('returns bool value and fallback for non-bool', () {
      expect(readBool(true), isTrue);
      expect(readBool(false), isFalse);
      expect(readBool('true'), isFalse);
      expect(readBool('true', true), isTrue);
    });
  });

  group('readString', () {
    test('returns string value, fallback and toString conversion', () {
      expect(readString('abc'), 'abc');
      expect(readString(null), '');
      expect(readString(null, 'fallback'), 'fallback');
      expect(readString(123), '123');
    });
  });
}
