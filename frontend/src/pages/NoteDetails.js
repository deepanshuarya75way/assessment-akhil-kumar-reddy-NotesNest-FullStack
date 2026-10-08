import React, { useEffect, useState } from "react";
import {useParams} from "react-router-dom";

function NoteDetails(){
  const{slug} = useParams();
  const[note,setNote] = useState(null);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/notes/slug/${slug}`)
    .then((res) => res.json())
    .then((data) => setNote(data));
  }, [slug]);

  if(!note){
    return <p>loading</p>
  }

  return(
    <div>
      <h1>{note.title}</h1>
      <p>Subject: {note.subject}</p>
      <p>Contributer: {note.conmtributor}</p>

      <a href={note.driveLink} target = "_blank" rel = "noreferrer">Download Note</a>
      </div>
  );
}

export default NoteDetails