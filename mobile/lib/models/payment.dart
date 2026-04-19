class Payment {
  final String id;
  final String userId;
  final int amount;
  final String status;
  final String? transactionRef;
  final String? paymentMethod;
  final String? paidAt;
  final String createdAt;
  final Map<String, dynamic>? user;

  Payment({
    required this.id,
    required this.userId,
    required this.amount,
    required this.status,
    required this.createdAt,
    this.transactionRef,
    this.paymentMethod,
    this.paidAt,
    this.user,
  });

  factory Payment.fromJson(Map<String, dynamic> json) {
    return Payment(
      id: json['id'] as String,
      userId: json['userId'] as String,
      amount: json['amount'] as int,
      status: json['status'] as String,
      transactionRef: json['transactionRef'] as String?,
      paymentMethod: json['paymentMethod'] as String?,
      paidAt: json['paidAt'] as String?,
      createdAt: json['createdAt'] as String,
      user: json['user'] as Map<String, dynamic>?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'amount': amount,
      'status': status,
      'transactionRef': transactionRef,
      'paymentMethod': paymentMethod,
      'paidAt': paidAt,
      'createdAt': createdAt,
      'user': user,
    };
  }
}
