import mongoose from 'mongoose';

const benchmarkSchema = new mongoose.Schema(
  {
    phone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Phone',
      required: false,
    },
    device_name: {
      type: String,
      required: [true, 'Device name is required'],
      trim: true,
    },
    submitted_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    processor: {
      type: String,
      required: [true, 'Processor (SoC) is required'],
      trim: true,
    },
    benchmarks: {
      antutu: {
        total: Number,
        cpu: Number,
        gpu: Number,
        memory: Number,
        ux: Number,
      },
      geekbench: {
        single_core: Number,
        multi_core: Number,
        compute: Number,
      },
      throttle: {
        stability: Number,
        gips_max: Number,
        gips_avg: Number,
        gips_min: Number,
      }
    },
    screenshot_url: {
      type: String,
      required: [true, 'Screenshot evidence is required'],
    },
    user_info: {
      name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
      },
      android_version: {
        type: String,
        trim: true,
      },
      memory_config: {
        type: String,
        trim: true,
      },
      comment: {
        type: String,
        trim: true,
        maxlength: 1000,
      }
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    }
  },
  { timestamps: true }
);

const UserBenchmark = mongoose.model('UserBenchmark', benchmarkSchema);

export default UserBenchmark;
