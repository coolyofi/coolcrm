import Link from "next/link"

export default function Home() {
  return (
    <div style={{ padding: 40 }}>
      <h1>CoolCRM</h1>

      <div>
        <Link href="/add">➕ 新增客户</Link>
      </div>

      <div style={{ marginTop: 20 }}>
        <Link href="/history">📜 查看历史</Link>
      </div>
    </div>
  )
}