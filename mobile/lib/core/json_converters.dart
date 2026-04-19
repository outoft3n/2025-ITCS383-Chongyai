/// Helpers so mobile models tolerate Prisma/JSON shapes (partial embeds, int as double).
int? readInt(dynamic value) {
  if (value == null) return null;
  if (value is int) return value;
  if (value is double) return value.round();
  return int.tryParse(value.toString());
}

bool readBool(dynamic value, [bool fallback = false]) {
  if (value is bool) return value;
  return fallback;
}

String readString(dynamic value, [String fallback = '']) {
  if (value == null) return fallback;
  if (value is String) return value;
  return value.toString();
}
