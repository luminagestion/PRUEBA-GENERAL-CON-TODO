
const GENRES = ["Rock","Pop","Indie","Tropical","Electronica","tango","candombe","musica popular","calsica","hip hop","trap","rap","fusion","instrumental","experimental","infantil","religiosa","milonga","folklore","country","folk"]

export default function GenreMultiSelect({value=[], onChange}){
  function toggle(g){
    const set = new Set(value)
    if(set.has(g)) set.delete(g); else set.add(g)
    onChange(Array.from(set))
  }
  return (
    <div className="row">
      {GENRES.map(g=>(
        <label key={g} className="badge" style={{cursor:'pointer'}}>
          <input type="checkbox" checked={value.includes(g)} onChange={()=>toggle(g)} style={{marginRight:8}}/>
          {g}
        </label>
      ))}
    </div>
  )
}
