// src/pages/NotesList.js
import React, { useEffect, useState, useMemo, useCallback } from "react";
import logo from "../assets/logo.gif";

import {
  Box,
  TextField,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  MenuItem,
  InputAdornment,
  CircularProgress,
} from "@mui/material";

import DownloadIcon from "@mui/icons-material/Download";
import SearchIcon from "@mui/icons-material/Search";
import Fuse from "fuse.js";
import axios from "axios";

const NotesList = () => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL || "";

  const apiUrl = useCallback(
    (path) => {
      if (!path.startsWith("/")) {
        path = "/" + path;
      }

      if (backendUrl) {
        return backendUrl.replace(/\/+$/, "") + path;
      }

      return path;
    },
    [backendUrl]
  );

  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const maxRetries = 3;
  const retryDelay = 1000;

  // Get unique subjects
  const subjects = useMemo(() => {
    return [
      ...new Set(
        notes
          .map((note) => note.subject)
          .filter(Boolean)
      ),
    ];
  }, [notes]);

  // Fuse search
  const fuse = useMemo(() => {
    return new Fuse(notes, {
      keys: ["title", "description", "subject", "contributor"],
      threshold: 0.4,
    });
  }, [notes]);

  // Fetch notes
  const fetchNotes = useCallback(
    async (retryCount = 0) => {
      try {
        const res = await axios.get(apiUrl("/api/notes/approved"), {
          timeout: 10000,
        });

        const fetchedNotes = Array.isArray(res.data) ? res.data : [];

        setNotes(fetchedNotes);
        setFilteredNotes(fetchedNotes);
        setError(null);
      } catch (err) {
        console.error("Error fetching notes:", err);

        if (retryCount < maxRetries) {
          console.log(
            `Retrying... Attempt ${retryCount + 1} of ${maxRetries}`
          );

          setTimeout(() => {
            fetchNotes(retryCount + 1);
          }, retryDelay * (retryCount + 1));
        } else {
          const status = err?.response?.status || "N/A";

          const message =
            err?.response?.data?.message ||
            err?.message ||
            "Unknown error";

          setError(
            `Unable to fetch notes. ${message} (status: ${status})`
          );
        }
      }
    },
    [apiUrl]
  );

  // Initial fetch
  useEffect(() => {
    let mounted = true;

    const loadNotes = async () => {
      setLoading(true);

      try {
        await fetchNotes();
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadNotes();

    return () => {
      mounted = false;
    };
  }, [fetchNotes]);

  // Search and filter
  useEffect(() => {
    let results = notes;

    if (searchQuery.trim()) {
      results = fuse
        .search(searchQuery.trim())
        .map((result) => result.item);
    }

    if (selectedSubject) {
      results = results.filter(
        (note) => note.subject === selectedSubject
      );
    }

    setFilteredNotes(results);
  }, [searchQuery, selectedSubject, notes, fuse]);

  return (
    <Box sx={{ padding: 3 }}>
      {/* Header */}
      <Box sx={{ textAlign: "center", mb: 3 }}>
        <img
          src={logo}
          alt="Notes Nest Logo"
          style={{
            height: 80,
            marginBottom: 10,
          }}
        />

        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Browse Notes
        </Typography>
      </Box>

      {/* Search and filter */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={7}>
          <TextField
            fullWidth
            label="Search notes..."
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="primary" />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12} md={5}>
          <TextField
            select
            fullWidth
            label="Filter by subject"
            variant="outlined"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <MenuItem value="">All Subjects</MenuItem>

            {subjects.map((subject) => (
              <MenuItem key={subject} value={subject}>
                {subject}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      {/* Loading */}
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mt: 6,
          }}
        >
          <CircularProgress color="primary" />
        </Box>
      ) : error ? (
        /* Error */
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Typography color="error" align="center">
            {error}
          </Typography>

          <Box sx={{ mt: 1 }}>
            <Button
              variant="text"
              color="primary"
              onClick={async () => {
                setLoading(true);
                setError(null);

                try {
                  await fetchNotes();
                } finally {
                  setLoading(false);
                }
              }}
            >
              Retry
            </Button>

            <Button
              variant="text"
              color="secondary"
              href={apiUrl("/api/notes/approved")}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ ml: 2 }}
            >
              Open backend endpoint
            </Button>
          </Box>

          <Typography
            variant="caption"
            display="block"
            sx={{
              mt: 1,
              color: "gray",
            }}
          >
            If this persists, verify that REACT_APP_BACKEND_URL is
            set and the backend is reachable.
          </Typography>
        </Box>
      ) : filteredNotes.length === 0 ? (
        /* No notes */
        <Typography
          variant="body1"
          sx={{
            mx: "auto",
            mt: 5,
            textAlign: "center",
          }}
        >
          No notes found.
        </Typography>
      ) : (
        /* Notes */
        <Grid container spacing={3}>
          {filteredNotes.map((note) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              key={note._id}
            >
              <Card
                elevation={4}
                sx={{
                  borderRadius: 2,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {note.title}
                  </Typography>

                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Subject:</strong>{" "}
                    {note.subject || "N/A"}
                  </Typography>

                  <Typography variant="body2" sx={{ mb: 2 }}>
                    <strong>Contributor:</strong>{" "}
                    {note.contributor || "N/A"}
                  </Typography>

                  {/* View Note */}
                  {note.slug && (
                    <Button
                      variant="text"
                      color="primary"
                      href={`/notes/${encodeURIComponent(note.slug)}`}
                      sx={{
                        mb: 1,
                        alignSelf: "flex-start",
                      }}
                    >
                      View Note
                    </Button>
                  )}

                  {/* Download */}
                  {note.driveLink && (
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<DownloadIcon />}
                      href={note.driveLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        mt: "auto",
                      }}
                    >
                      Download
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default NotesList;