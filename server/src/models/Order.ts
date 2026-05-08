import mongoose, { Schema, Document } from 'mongoose';

interface IOrderItem {
  menuItemId: mongoose.Types.ObjectId;
  name: string;
  quantity: number;
  price: number;
}

export interface IOrder extends Document {
  tableId: string;
  customerName: string;
  customerPhone: string;
  items: IOrderItem[];
  status: 'Pending Payment' | 'Received' | 'In Kitchen' | 'Ready' | 'Served';
  totalAmount: number;
  paymentStatus?: 'Pending' | 'Paid' | 'Failed';
  paymentMethod?: string;
  paymentId?: string;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema: Schema = new Schema({
  tableId: { type: String, required: true },
  customerName: { type: String, required: true, trim: true },
  customerPhone: { type: String, required: true, trim: true },
  items: [{
    menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  status: { 
    type: String, 
    enum: ['Pending Payment', 'Received', 'In Kitchen', 'Ready', 'Served'],
    default: 'Pending Payment'
  },
  totalAmount: { type: Number, required: true },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Pending'
  },
  paymentMethod: { type: String },
  paymentId: { type: String },
  paidAt: { type: Date }
  ,
  feedback: {
    rating: { type: Number },
    comments: { type: String },
    submittedAt: { type: Date }
  }
}, { timestamps: true });

export default mongoose.model<IOrder>('Order', OrderSchema);