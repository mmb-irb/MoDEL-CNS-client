/// <reference types="react-scripts" />

interface ImgAttr<T> extends React.ImgHTMLAttributes<T> {
  loading: 'auto' | 'lazy' | 'eager';
}
