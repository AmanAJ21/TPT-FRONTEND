// Transport Bill data types

export enum BillStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  IN_PROGRESS = 'IN_PROGRESS'
}

export interface TransportBillData {
  bill: number;
  ms: string;
  gstno: string;
  otherDetail: string;
  srno: number;
  lrno: number;
  lrDate: Date;
  invoiceNo: string;
  consignorConsignee: string;
  handleCharges: number;
  detention: number;
  freight: number;
  total: number;
  status: BillStatus;
}

export interface OwnerData {
  contactNo: number;
  ownerNameAndAddress: string;
  panNo: string;
  driverNameAndMob: string;
  licenceNo: string;
  chasisNo: string;
  engineNo: string;
  insuranceCo: string;
  policyNo: string;
  policyDate: Date;
  srno: number;
  lrno: number;
  packages: number;
  description: string;
  wtKgs: number;
  remarks: string;
  brokerName: string;
  brokerPanNo: string;
  lorryHireAmount: number;
  accNo: number;
  otherChargesHamliDetentionHeight: number;
  totalLorryHireRs: number;
  advAmt1: number;
  advDate1: Date;
  neftImpsIdno1: string;
  advAmt2: number;
  advDate2: Date;
  neftImpsIdno2: string;
  advAmt3: number;
  advDate3: Date;
  neftImpsIdno3: string;
  balanceAmt: number;
  otherChargesHamaliDetentionHeight: string;
  deductionInClaimPenalty: string;
  finalNeftImpsIdno: string;
  finalDate: Date;
  deliveryDate: Date;
}

export interface TransportBill {
  id?: string; // Custom unique ID (e.g., TE-20250730-0001)
  _id?: string; // MongoDB ObjectId
  date: Date;
  vehicleNo: string;
  from: string;
  to: string;
  transportBillData: TransportBillData;
  ownerData: OwnerData;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TransportBillFormData {
  date: string;
  vehicleNo: string;
  from: string;
  to: string;
  transportBillData: Omit<TransportBillData, 'lrDate'> & { lrDate: string };
  ownerData: Omit<OwnerData, 'policyDate' | 'advDate1' | 'advDate2' | 'advDate3' | 'finalDate' | 'deliveryDate'> & {
    policyDate: string;
    advDate1: string;
    advDate2: string;
    advDate3: string;
    finalDate: string;
    deliveryDate: string;
  };
}