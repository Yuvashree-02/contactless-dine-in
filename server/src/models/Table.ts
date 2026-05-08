import mongoose, { Document, Schema } from 'mongoose';

export interface ITable extends Document {
    tableNumber: number;
    tableCode: string;
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
    tableCode: {
        type: String,
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

const toTableCode = (tableNumber: number) => `T${String(tableNumber).padStart(3, '0')}`;

TableSchema.pre('validate', function (next) {
    const doc = this as unknown as ITable;
    if (!doc.tableCode && doc.tableNumber) {
        doc.tableCode = toTableCode(doc.tableNumber);
    }

    next();
});

const Table = mongoose.model<ITable>('Table', TableSchema);

export default Table;