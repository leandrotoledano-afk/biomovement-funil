
import { useEffect, useState } from "react"

export default function FunilDashboard() {
  const [deals,setDeals]=useState([])
  const [loading,setLoading]=useState(true)

  useEffect(()=>{

    fetch("/api/deals")
      .then(r=>r.json())
      .then(d=>{
        setDeals(d)
        setLoading(false)
      })

  },[])

  const totalMRR=deals.reduce(
    (a,b)=>a+(Number(b.mrr)||0),0
  )

  return (

<div style={{
background:"#081229",
minHeight:"100vh",
padding:"40px",
color:"#fff",
fontFamily:"Arial"
}}>

<h1 style={{
color:"#69ef77",
fontSize:"52px"
}}>
🟢 FUNIL BIOMOVEMENT
</h1>

<p>
Dashboard Operacional
|
{deals.length} deals
|
MRR R$
{totalMRR.toLocaleString()}
</p>

<div style={{
display:"grid",
gridTemplateColumns:
"repeat(auto-fit,minmax(320px,1fr))",
gap:"20px",
marginTop:"40px"
}}>

{
loading
?
"Carregando..."
:
deals.map(d=>(

<div key={d.id}
style={{
background:"#101c35",
padding:"25px",
borderRadius:"14px",
borderLeft:"4px solid #69ef77"
}}>

<h3>{d.empresa}</h3>

<p>{d.local}</p>

<p>
📍 {d.escolas || 0}
escolas
</p>

<p>
💰 R$
{Number(d.mrr||0)
.toLocaleString()}
</p>

<p>
Status:
{d.status}
</p>

</div>

))
}

</div>

</div>

)

}