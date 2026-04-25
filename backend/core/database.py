import os

from dotenv import load_dotenv
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from psycopg.rows import dict_row
from psycopg_pool import AsyncConnectionPool

load_dotenv()
DATABASE_URL = os.environ["DATABASE_URL"]

# 공용 연결 풀 생성
pool = AsyncConnectionPool(
    conninfo=DATABASE_URL,
    open=False,
    kwargs={
        "autocommit": True,
        "row_factory": dict_row,
    },
)

# 랭그래프 체크포인터
checkpointer = AsyncPostgresSaver(pool)  # type: ignore


async def init_db():
    await checkpointer.setup()

    # 테이블 생성
    async with pool.connection() as conn:
        await conn.execute(
            """
            CREATE TABLE IF NOT EXISTS interview_sessions (
                session_id TEXT PRIMARY KEY,
                title TEXT NOT NULL DEFAULT '모의면접',
                is_finished BOOLEAN NOT NULL DEFAULT FALSE,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
            """
        )


# 모의면접 시작 시 세션 생성
async def create_session(session_id, title):
    async with pool.connection() as conn:
        await conn.execute(
            "INSERT INTO interview_sessions (session_id, title) VALUES (%s, %s)",
            (session_id, title),
        )


# 전체 모의면접 세션 조회
async def get_sessions():
    async with pool.connection() as conn:
        cur = await conn.execute(
            "SELECT * FROM interview_sessions ORDER BY created_at DESC"
        )
        return await cur.fetchall()


# 모의면접 종료 시 세션 업데이트
async def finish_session(session_id):
    async with pool.connection() as conn:
        await conn.execute(
            "UPDATE interview_sessions SET is_finished = TRUE WHERE session_id = %s",
            (session_id,),
        )
