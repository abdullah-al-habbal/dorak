class AffiliationEndpoints {
  AffiliationEndpoints._();

  static const barberAffiliate = '/barbers/{barber}/affiliate';
  static const barberAffiliations = '/barbers/{barber}/affiliations';
  static const affiliationAccept = '/affiliations/{affiliation}/accept';
  static const affiliationReject = '/affiliations/{affiliation}/reject';
  static const affiliationTerminate = '/affiliations/{affiliation}/terminate';
  static const branchAffiliations = '/branch/affiliations';
  static const branchAffiliationAccept = '/branch/affiliations/{affiliation}/accept';
  static const branchAffiliationReject = '/branch/affiliations/{affiliation}/reject';
  static const branchAffiliationTerminate = '/branch/affiliations/{affiliation}/terminate';
}
