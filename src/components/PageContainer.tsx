import React from "react";
import { Container } from "@mui/material";

type Props = {
  children: React.ReactNode;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
};

const PageContainer: React.FC<Props> = ({ children, maxWidth = "md" }) => {
  return (
    <Container maxWidth={maxWidth} sx={{ py: 3 }}>
      {children}
    </Container>
  );
};

export default PageContainer;
