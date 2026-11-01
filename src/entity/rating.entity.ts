import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { BaseTimeEntity } from './base-time.entity.js';
import { Member } from './member.entity.js';

@Entity('rating')
@Unique('uk_rating_member_movie', ['member', 'movieId'])
export class Rating extends BaseTimeEntity {
  @PrimaryGeneratedColumn({ name: 'rating_id', type: 'bigint' })
  ratingId!: number;

  // 여러 평점이 한 회원에 속합니다. member_id가 실제 외래키입니다.
  @ManyToOne(() => Member, { nullable: false })
  @JoinColumn({ name: 'member_id' })
  member!: Member;

  // TMDB의 영화 번호를 저장하는 일반 컬럼입니다. 별도 영화 테이블은 없습니다.
  @Column({ name: 'movie_id', type: 'bigint' })
  movieId!: number;

  @Column({ type: 'tinyint' })
  score!: number;

  @Column({ type: 'text', nullable: true })
  comment!: string | null;
}
