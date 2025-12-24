import mongoose, { Document, Schema } from 'mongoose';

export interface ITable extends Document {
    tableNumber: number;
    capacity: number;
    isAvailable: boolean;
    qrCode?: string;
}

const TableSchema: Schema = new Schema({
    tableNumber: {
        type: Number,
        required: true,
        unique: true
    },
    capacity: {
        type: Number,
        required: true
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    qrCode: {
        type: String
    }
}, {
    timestamps: true
});

const Table = mongoose.model<ITable>('Table', TableSchema);

export default Table;