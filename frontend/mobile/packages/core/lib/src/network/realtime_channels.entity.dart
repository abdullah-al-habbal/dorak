class RealtimeChannels {
  const RealtimeChannels._();

  static String branch(String branchId) => 'branch.$branchId';

  static String barber(String barberId) => 'barber.$barberId';

  static String client(String clientId) => 'client.$clientId';
}
