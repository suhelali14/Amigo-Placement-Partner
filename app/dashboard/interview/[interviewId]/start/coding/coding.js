import CodingRoundPage from '@/components/CodingRoundPage';

const Coding = ({ params }) => {
  return <CodingRoundPage params={params} />;
};

export async function getServerSideProps(context) {
  return {
    props: {
      params: context.params,
    },
  };
}

export default Coding;
