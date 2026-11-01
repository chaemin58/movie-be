# Repository 사용 방식

별도 Repository 클래스 대신 TypeORM의 기본 `Repository<T>`를 사용합니다.

`AppModule`에서 `TypeOrmModule.forFeature([Member, Rating])`로 등록하고,
서비스 생성자에서 `@InjectRepository(Member)` 또는 `@InjectRepository(Rating)`으로 주입받습니다.

`MemberService`는 `exists()`로 중복 여부를 확인하고, `RatingService`는 회원 존재 여부를 확인한 뒤 `find()`로 해당 회원의 평점을 최신순으로 조회합니다.
