class Message {
  final String id;
  final String? senderId;
  final String? receiverId;
  final String content;
  final bool isBot;
  final String sessionId;
  final String createdAt;

  Message({
    required this.id,
    this.senderId,
    this.receiverId,
    required this.content,
    required this.isBot,
    required this.sessionId,
    required this.createdAt,
  });

  factory Message.fromJson(Map<String, dynamic> json) {
    return Message(
      id: json['id'] as String,
      senderId: json['senderId'] as String?,
      receiverId: json['receiverId'] as String?,
      content: json['content'] as String,
      isBot: json['isBot'] as bool,
      sessionId: json['sessionId'] as String,
      createdAt: json['createdAt'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'senderId': senderId,
      'receiverId': receiverId,
      'content': content,
      'isBot': isBot,
      'sessionId': sessionId,
      'createdAt': createdAt,
    };
  }
}
