FROM golang:1.24-alpine AS builder

# Install build dependencies
RUN apk add --no-cache git

# Install Nuclei
RUN go install -v github.com/projectdiscovery/nuclei/v3/cmd/nuclei@latest

# Install Subfinder
RUN go install -v github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest

# Final stage
FROM alpine:latest

# Install runtime dependencies
RUN apk add --no-cache \
    perl \
    perl-net-ssleay \
    ca-certificates \
    git \
    curl

# Install Nikto
RUN git clone https://github.com/sullo/nikto /opt/nikto

# Copy Go binaries from builder
COPY --from=builder /go/bin/nuclei /usr/local/bin/nuclei
COPY --from=builder /go/bin/subfinder /usr/local/bin/subfinder

# Update Nuclei templates
RUN nuclei -update-templates

# Create working directory
WORKDIR /scans

# Keep container running
CMD ["tail", "-f", "/dev/null"]
