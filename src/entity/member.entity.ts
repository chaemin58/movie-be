import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseTimeEntity } from './base-time.entity.js';

//member 테이블과 연결
@Entity('member')
export class Member extends BaseTimeEntity {
  @PrimaryGeneratedColumn({ name: 'member_id', type: 'bigint' })
  memberId!: number;

  @Column({ type: 'varchar', length: 254, unique: true })
  email!: string;

  // 이번 주에는 더미 문자열만 사용합니다. 일반 조회에서도 비밀번호를 제외합니다.
  @Column({ type: 'varchar', length: 60, select: false })
  password!: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  nickname!: string;
}
