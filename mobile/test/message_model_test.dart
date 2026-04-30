import 'package:chongyai_mobile/models/message.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('Message.fromJson and toJson preserve all fields', () {
    final json = <String, dynamic>{
      'id': 'msg-1',
      'senderId': 'user-1',
      'receiverId': 'user-2',
      'content': 'Hello!',
      'isBot': false,
      'sessionId': 'session-1',
      'createdAt': '2026-04-30T08:30:00.000Z',
    };

    final message = Message.fromJson(json);
    final serialized = message.toJson();

    expect(message.id, 'msg-1');
    expect(message.senderId, 'user-1');
    expect(message.receiverId, 'user-2');
    expect(message.content, 'Hello!');
    expect(message.isBot, false);
    expect(message.sessionId, 'session-1');
    expect(message.createdAt, '2026-04-30T08:30:00.000Z');

    expect(serialized, json);
  });
}
