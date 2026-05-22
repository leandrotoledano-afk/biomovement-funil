import { useEffect, useState } from "react";

export default function FunilDashboard() {

  const [deals,setDeals]=useState([]);

  useEffect(()=>{

    fetch("/api/deals")
      .then(r=>r.json())
      .then(data=>setDeals(data));

  },[]);

  return (

    <div style={{
      background:"#0b132b",
      color:"#fff",
      minHeight:"100vh",
      padding:"40px",
      fontFamily:"Arial"
    }}>

      <h1>FUNIL BIOMOVEMENT</h1>

      <p>Total deals: {deals.length}</p>

      <table
        style={{
          width:"100%",
          marginTop:"20px",
          borderCollapse:"collapse"
        }}
      >

        <thead>

          <tr>

            <th>Empresa</th>
            <th>Status</th>
            <th>Local</th>
            <th>Escolas</th>
            <th>MRR</th>

          </tr>

        </thead>

        <tbody>

          {deals.map(d=>(

            <tr key={d.id}>

              <td>{d.empresa}</td>
              <td>{d.status}</td>
              <td>{d.local}</td>
              <td>{d.escolas}</td>
              <td>R$ {d.mrr}</td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  )

}