from core.state import JobDescription


def format_jd(job_description: JobDescription | None) -> str:
    if job_description is None:
        return "채용공고가 제공되지 않았습니다."
    lines = [
        f"- 회사명: {job_description['company']}",
        f"- 직무명: {job_description['position']}",
        f"- 주요업무: {', '.join(job_description['responsibilities'])}",
        f"- 자격요건: {', '.join(job_description['qualifications'])}",
        f"- 우대사항: {', '.join(job_description['preferred'])}",
    ]
    return "\n".join(lines)
