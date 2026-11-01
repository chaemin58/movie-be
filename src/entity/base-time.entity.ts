import { CreateDateColumn, UpdateDateColumn } from 'typeorm';

// 자체 테이블은 없고 Member와 Rating이 공통 날짜 컬럼을 상속받습니다.
export abstract class BaseTimeEntity {
  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 0 })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', precision: 0 })
  updatedAt!: Date;
}
